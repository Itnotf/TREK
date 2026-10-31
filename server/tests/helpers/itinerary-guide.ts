import type { ItineraryPlan } from '@trek/shared';

export const itineraryGuideFixture = (): NonNullable<ItineraryPlan['guide']> => ({
  route: '大理古城 → 洱海 → 大理',
  rationale: '先看古城街巷，再到湖边看风景，减少往返并留出坐休时间。',
  highlights: ['古城街巷与白族建筑', '洱海湖畔的开阔风景'],
  budget: {
    scope: '每人，不含往返大理的大交通',
    estimate: '餐饮与市内交通约 150–250 元；住宿另计，非实时报价。',
    breakdown: [
      { category: '餐饮', estimate: '约 100–150 元', notes: '按两顿普通正餐和小吃估算。' },
      { category: '交通', estimate: '约 50–100 元', notes: '市内短程出行预留，实际以路线和人数为准。' },
    ],
  },
  preparation: ['先确认住宿的停车条件和电梯，再决定酒店；目前未预订。'],
});

export const itineraryDayGuideFixture = (): NonNullable<ItineraryPlan['days'][number]['guide']> => ({
  overview: '沿古城主要街巷看白族民居，找茶馆坐一坐，再按体力选择湖边短走。',
  dining: '古城内选择有室内座位的白族菜馆，尝试饵丝和砂锅鱼；具体店铺与营业时间待核实。',
  accommodation: '优先古城外围可停车、有电梯的酒店，比步行街深处更适合带老人出行；酒店未预订。',
  alternative: '雨天缩短湖边停留，改在古城茶馆坐休；疲劳时直接返回住宿。',
});
