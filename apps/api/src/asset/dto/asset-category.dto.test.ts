import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { CreateAssetCategoryDto } from './asset-category.dto.js';

describe('CreateAssetCategoryDto — Arabic fields', () => {
  it('accepts Arabic text in nameAr alongside the required English nameEn', async () => {
    const dto = plainToInstance(CreateAssetCategoryDto, {
      categoryCode: 'EXCAVATORS',
      nameEn: 'Excavators',
      nameAr: 'حفارات',
      riskClassification: 'medium',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.nameAr).toBe('حفارات');
  });
});
