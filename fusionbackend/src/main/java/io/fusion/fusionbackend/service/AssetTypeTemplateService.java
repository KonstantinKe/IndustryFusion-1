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

package io.fusion.fusionbackend.service;

import io.fusion.fusionbackend.exception.ResourceNotFoundException;
import io.fusion.fusionbackend.model.AssetType;
import io.fusion.fusionbackend.model.AssetTypeTemplate;
import io.fusion.fusionbackend.model.Field;
import io.fusion.fusionbackend.model.FieldTarget;
import io.fusion.fusionbackend.repository.AssetTypeTemplateRepository;
import io.fusion.fusionbackend.repository.FieldTargetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@Transactional
public class AssetTypeTemplateService {
    private final AssetTypeTemplateRepository assetTypeTemplateRepository;
    private final AssetTypeService assetTypeService;
    private final FieldTargetRepository fieldTargetRepository;
    private final FieldService fieldService;

    @Autowired
    public AssetTypeTemplateService(AssetTypeTemplateRepository assetTypeTemplateRepository,
                                    AssetTypeService assetTypeService,
                                    FieldTargetRepository fieldTargetRepository,
                                    FieldService fieldService) {
        this.assetTypeTemplateRepository = assetTypeTemplateRepository;
        this.assetTypeService = assetTypeService;
        this.fieldTargetRepository = fieldTargetRepository;
        this.fieldService = fieldService;
    }

    public Set<AssetTypeTemplate> getAssetTypeTemplates() {
        return assetTypeTemplateRepository.findAll(AssetTypeTemplateRepository.DEFAULT_SORT);
    }

    public AssetTypeTemplate getAssetTypeTemplate(final Long assetTypeTemplateId, final boolean deep) {
        if (deep) {
            return assetTypeTemplateRepository.findDeepById(assetTypeTemplateId)
                    .orElseThrow(ResourceNotFoundException::new);
        }
        return assetTypeTemplateRepository.findById(assetTypeTemplateId)
                .orElseThrow(ResourceNotFoundException::new);
    }

    public AssetTypeTemplate createAssetTypeTemplate(final Long assetTypeId,
                                                     final AssetTypeTemplate assetTypeTemplate) {
        final AssetType assetType = assetTypeService.getAssetType(assetTypeId);

        assetTypeTemplate.setAssetType(assetType);

        return assetTypeTemplateRepository.save(assetTypeTemplate);
    }

    public AssetTypeTemplate updateAssetTypeTemplate(final Long assetTypeTemplateId,
                                                     final AssetTypeTemplate sourceAssetTypeTemplate) {
        final AssetTypeTemplate targetAssetTypeTemplate = getAssetTypeTemplate(assetTypeTemplateId,
                false);

        targetAssetTypeTemplate.copyFrom(sourceAssetTypeTemplate);

        return targetAssetTypeTemplate;
    }

    public void deleteAssetTypeTemplate(final Long assetTypeTemplateId) {

        final AssetTypeTemplate assetTypeTemplate = getAssetTypeTemplate(assetTypeTemplateId,
                false);

        assetTypeTemplateRepository.delete(assetTypeTemplate);
    }

    public Set<FieldTarget> getFieldTargets(final Long assetTypeTemplateId) {
        final AssetTypeTemplate assetTypeTemplate = getAssetTypeTemplate(assetTypeTemplateId, false);
        return assetTypeTemplate.getFieldTargets();
    }

    public FieldTarget getFieldTarget(final Long assetTypeTemplateId, final Long fieldTargetId) {
        final AssetTypeTemplate assetTypeTemplate = getAssetTypeTemplate(assetTypeTemplateId, false);
        return assetTypeTemplate.getFieldTargets().stream()
                .filter(field -> field.getId().equals(fieldTargetId))
                .findAny()
                .orElseThrow(ResourceNotFoundException::new);
    }

    public FieldTarget getFieldTarget(final AssetTypeTemplate assetTypeTemplate, final Long fieldTargetId) {
        return assetTypeTemplate.getFieldTargets().stream()
                .filter(field -> field.getId().equals(fieldTargetId))
                .findAny()
                .orElseThrow(ResourceNotFoundException::new);
    }

    public FieldTarget createFieldTarget(final Long assetTypeTemplateId, final Long fieldId,
                                         final FieldTarget fieldTarget) {
        final AssetTypeTemplate assetTypeTemplate = getAssetTypeTemplate(assetTypeTemplateId, false);
        final Field field = fieldService.getField(fieldId, false);

        fieldTarget.setAssetTypeTemplate(assetTypeTemplate);
        assetTypeTemplate.getFieldTargets().add(fieldTarget);
        fieldTarget.setField(field);

        return fieldTargetRepository.save(fieldTarget);
    }

    public FieldTarget updateFieldTarget(final Long assetTypeTemplateId, final Long fieldTargetId,
                                           final FieldTarget fieldTarget) {
        final FieldTarget targetFieldTarget = getFieldTarget(assetTypeTemplateId, fieldTargetId);

        targetFieldTarget.copyFrom(fieldTarget);

        return targetFieldTarget;
    }

    public void deleteFieldTarget(final Long assetTypeTemplateId, final Long fieldTargetId) {
        final AssetTypeTemplate assetTypeTemplate = getAssetTypeTemplate(assetTypeTemplateId, false);
        final FieldTarget fieldTarget = getFieldTarget(assetTypeTemplate, fieldTargetId);

        assetTypeTemplate.getFieldTargets().remove(fieldTarget);

        fieldTargetRepository.delete(fieldTarget);
    }

    public AssetTypeTemplate setAssetType(final Long assetTypeTemplateId, final Long assetTypeId) {
        final AssetTypeTemplate assetTypeTemplate = getAssetTypeTemplate(assetTypeTemplateId,
                false);
        final AssetType assetType = assetTypeService.getAssetType(assetTypeId);

        assetTypeTemplate.setAssetType(assetType);

        return assetTypeTemplate;
    }
}
