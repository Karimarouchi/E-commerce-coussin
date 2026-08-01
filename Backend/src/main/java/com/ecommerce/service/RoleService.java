package com.ecommerce.service;

import com.ecommerce.dto.request.RoleRequest;
import com.ecommerce.dto.request.UpdatePermissionsRequest;
import com.ecommerce.dto.response.PermissionDTO;
import com.ecommerce.dto.response.RoleResponse;
import com.ecommerce.entity.Permission;
import com.ecommerce.entity.Role;
import com.ecommerce.enums.PermissionModule;
import com.ecommerce.repository.PermissionRepository;
import com.ecommerce.repository.RoleRepository;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;

    // ── GET all roles ─────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<RoleResponse> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(this::mapToRoleResponse)
                .collect(Collectors.toList());
    }

    // ── GET role by ID ────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public RoleResponse getRoleById(Long id) {
        Role role = findRoleOrThrow(id);
        return mapToRoleResponse(role);
    }

    // ── GET role by name ──────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public RoleResponse getRoleByName(String name) {
        Role role = roleRepository.findByName(name)
                .orElseThrow(() -> new RuntimeException("Rôle non trouvé: " + name));
        return mapToRoleResponse(role);
    }

    // ── CREATE role ───────────────────────────────────────────────────────────
    @Transactional
    public RoleResponse createRole(RoleRequest request) {
        String normalizedName = request.getName().toUpperCase().trim();

        if (roleRepository.existsByName(normalizedName)) {
            throw new RuntimeException("Un rôle avec le nom '" + normalizedName + "' existe déjà");
        }

        Role role = Role.builder()
                .name(normalizedName)
                .label(request.getLabel())
                .description(request.getDescription())
                .build();

        // Initialize all permission modules
        for (PermissionModule module : PermissionModule.values()) {
            boolean granted = false;
            if (request.getPermissions() != null && request.getPermissions().containsKey(module.name())) {
                granted = request.getPermissions().get(module.name());
            }
            role.addPermission(Permission.builder()
                    .module(module)
                    .granted(granted)
                    .build());
        }

        role = roleRepository.save(role);
        return mapToRoleResponse(role);
    }

    // ── UPDATE role ───────────────────────────────────────────────────────────
    @Transactional
    public RoleResponse updateRole(Long id, RoleRequest request) {
        Role role = findRoleOrThrow(id);

        // Check if name is changing and if new name already exists
        String normalizedName = request.getName().toUpperCase().trim();
        if (!role.getName().equals(normalizedName) && roleRepository.existsByName(normalizedName)) {
            throw new RuntimeException("Un rôle avec le nom '" + normalizedName + "' existe déjà");
        }

        role.setName(normalizedName);
        role.setLabel(request.getLabel());
        role.setDescription(request.getDescription());

        // Update permissions if provided
        if (request.getPermissions() != null) {
            updateRolePermissions(role, request.getPermissions());
        }

        role = roleRepository.save(role);
        return mapToRoleResponse(role);
    }

    // ── DELETE role ───────────────────────────────────────────────────────────
    @Transactional
    public void deleteRole(Long id) {
        Role role = findRoleOrThrow(id);

        // Prevent deleting roles that have users assigned
        long userCount = userRepository.countByRoleId(id);
        if (userCount > 0) {
            throw new RuntimeException(
                    "Impossible de supprimer le rôle '" + role.getLabel() +
                            "' car " + userCount + " utilisateur(s) y sont affecté(s)");
        }

        roleRepository.delete(role);
    }

    // ── UPDATE permissions for a role ─────────────────────────────────────────
    @Transactional
    public RoleResponse updatePermissions(Long roleId, UpdatePermissionsRequest request) {
        Role role = findRoleOrThrow(roleId);
        updateRolePermissions(role, request.getPermissions());
        role = roleRepository.save(role);
        return mapToRoleResponse(role);
    }

    // ── GET all permission modules ────────────────────────────────────────────
    public List<PermissionDTO> getAllPermissions() {
        List<PermissionDTO> permissions = new ArrayList<>();
        for (PermissionModule module : PermissionModule.values()) {
            permissions.add(PermissionDTO.builder()
                    .module(module.name())
                    .label(module.getLabel())
                    .build());
        }
        return permissions;
    }

    // ── GET permission matrix: all roles × all modules ────────────────────────
    @Transactional(readOnly = true)
    public Map<String, Map<String, Boolean>> getPermissionMatrix() {
        List<Role> roles = roleRepository.findAll();
        Map<String, Map<String, Boolean>> matrix = new LinkedHashMap<>();

        for (Role role : roles) {
            Map<String, Boolean> permMap = new LinkedHashMap<>();
            for (PermissionModule module : PermissionModule.values()) {
                permMap.put(module.name(), false);
            }
            for (Permission perm : role.getPermissions()) {
                permMap.put(perm.getModule().name(), perm.isGranted());
            }
            matrix.put(role.getName(), permMap);
        }

        return matrix;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private void updateRolePermissions(Role role, Map<String, Boolean> permissions) {
        for (Map.Entry<String, Boolean> entry : permissions.entrySet()) {
            PermissionModule module;
            try {
                module = PermissionModule.valueOf(entry.getKey());
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Module de permission invalide: " + entry.getKey());
            }

            Permission existingPerm = role.getPermissions().stream()
                    .filter(p -> p.getModule() == module)
                    .findFirst()
                    .orElse(null);

            if (existingPerm != null) {
                existingPerm.setGranted(entry.getValue());
            } else {
                role.addPermission(Permission.builder()
                        .module(module)
                        .granted(entry.getValue())
                        .build());
            }
        }
    }

    private RoleResponse mapToRoleResponse(Role role) {
        Map<String, Boolean> permMap = new LinkedHashMap<>();
        for (PermissionModule module : PermissionModule.values()) {
            permMap.put(module.name(), false);
        }
        for (Permission perm : role.getPermissions()) {
            permMap.put(perm.getModule().name(), perm.isGranted());
        }

        long userCount = userRepository.countByRoleId(role.getId());

        return RoleResponse.builder()
                .id(role.getId())
                .name(role.getName())
                .label(role.getLabel())
                .description(role.getDescription())
                .userCount(userCount)
                .permissions(permMap)
                .build();
    }

    private Role findRoleOrThrow(Long id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rôle non trouvé avec l'id: " + id));
    }
}
