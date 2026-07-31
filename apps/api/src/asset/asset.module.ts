import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module.js';
import { EventsModule } from '../events/events.module.js';

import { AssetCategoryController } from './asset-category.controller.js';
import { AssetCategoryService } from './asset-category.service.js';
import { AssetDocumentController } from './asset-document.controller.js';
import { AssetDocumentService } from './asset-document.service.js';
import { AssetLocationController } from './asset-location.controller.js';
import { AssetLocationService } from './asset-location.service.js';
import { AssetMeterController } from './asset-meter.controller.js';
import { AssetMeterService } from './asset-meter.service.js';
import { AssetController } from './asset.controller.js';
import { AssetService } from './asset.service.js';
import { EquipmentModelController } from './equipment-model.controller.js';
import { EquipmentModelService } from './equipment-model.service.js';
import { ManufacturerController } from './manufacturer.controller.js';
import { ManufacturerService } from './manufacturer.service.js';

@Module({
  imports: [AuditModule, EventsModule],
  controllers: [
    AssetCategoryController,
    ManufacturerController,
    EquipmentModelController,
    AssetLocationController,
    AssetController,
    AssetMeterController,
    AssetDocumentController,
  ],
  providers: [
    AssetCategoryService,
    ManufacturerService,
    EquipmentModelService,
    AssetLocationService,
    AssetService,
    AssetMeterService,
    AssetDocumentService,
  ],
  exports: [AssetService],
})
export class AssetModule {}
