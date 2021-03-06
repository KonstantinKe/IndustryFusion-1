/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

package io.fusion.fusionbackend.dto.mappers;

import io.fusion.fusionbackend.dto.FieldTargetDto;
import io.fusion.fusionbackend.model.FieldTarget;
import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class FieldTargetMapper implements EntityDtoMapper<FieldTarget, FieldTargetDto> {
    private FieldTargetDto toDtoShallow(FieldTarget entity) {
        if (entity == null) {
            return null;
        }
        return FieldTargetDto.builder()
                .id(entity.getId())
                .mandatory(entity.getMandatory())
                .name(entity.getName())
                .fieldType(entity.getFieldType())
                .label(entity.getLabel())
                .fieldId(EntityDtoMapper.getEntityId(entity.getField()))
                .assetTypeTemplateId(EntityDtoMapper.getEntityId(entity.getAssetTypeTemplate()))
                .description(entity.getDescription())
                .build();
    }

    @Override
    public FieldTargetDto toDto(FieldTarget entity, boolean embedChildren) {
        return toDtoShallow(entity);
    }

    @Override
    public FieldTarget toEntity(FieldTargetDto dto) {
        if (dto == null) {
            return null;
        }
        return FieldTarget.builder()
                .id(dto.getId())
                .mandatory(dto.getMandatory())
                .name(dto.getName())
                .fieldType(dto.getFieldType())
                .label(dto.getLabel())
                .description(dto.getDescription())
                .build();
    }

    @Override
    public Set<FieldTargetDto> toDtoSet(Set<FieldTarget> entitySet) {
        return entitySet.stream().map(this::toDtoShallow).collect(Collectors.toCollection(LinkedHashSet::new));
    }

    @Override
    public Set<Long> toEntityIdSet(Set<FieldTarget> entitySet) {
        return EntityDtoMapper.getSetOfEntityIds(entitySet);
    }

    @Override
    public Set<FieldTarget> toEntitySet(Set<FieldTargetDto> dtoSet) {
        return dtoSet.stream().map(this::toEntity).collect(Collectors.toCollection(LinkedHashSet::new));
    }
}
