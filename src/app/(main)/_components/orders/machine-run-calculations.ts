interface WizardData {
  bags: Array<{ weight: string }>;
  bagsWeight: string;
  powderWeight: string;
  waterToAdd: string;
  gramRatioStaffInput: string;
}

// Run calculation functions
export const getTotalBagsWeight = (data: WizardData): string => {
  const total = data.bags.reduce((sum, bag) => sum + (parseFloat(bag.weight) || 0), 0);
  return total.toFixed(1);
};

export const getTotalWetWeight = (data: WizardData): string => {
  const totalBagsWeight = parseFloat(getTotalBagsWeight(data));
  const bagsWeight = parseFloat(data.bagsWeight) || 0;
  return (totalBagsWeight - bagsWeight).toFixed(1);
};

export const getWaterRemoved = (data: WizardData): string => {
  const totalWetWeight = parseFloat(getTotalWetWeight(data));
  const powderWeight = parseFloat(data.powderWeight) || 0;
  return (totalWetWeight - powderWeight).toFixed(1);
};

export const getPowerToPackPerMl = (data: WizardData): string => {
  const powderWeight = parseFloat(data.powderWeight) || 0;
  const waterRemoved = parseFloat(getWaterRemoved(data));
  if (waterRemoved === 0) return "0.00";
  return (powderWeight / waterRemoved).toFixed(4);
};

export const getPackedPowderWeight = (data: WizardData): string => {
  const waterToAdd = parseFloat(data.waterToAdd) || 0;
  const powerToPackPerMl = parseFloat(getPowerToPackPerMl(data));
  return (waterToAdd * powerToPackPerMl).toFixed(1);
};

export const getPackingTotal = (data: WizardData): string => {
  const packedPowderWeight = parseFloat(getPackedPowderWeight(data));
  const waterToAdd = parseFloat(data.waterToAdd) || 0;
  return (packedPowderWeight + waterToAdd).toFixed(1);
};

export const getWaterContentPercentage = (data: WizardData): string => {
  const powderWeight = parseFloat(data.powderWeight) || 0;
  const totalWetWeight = parseFloat(getTotalWetWeight(data));
  if (totalWetWeight === 0) return "0.0";
  return (100 - (powderWeight / totalWetWeight) * 100).toFixed(1);
};

export const getPowderPerUnit = (data: WizardData): string => {
  const powderWeight = parseFloat(data.powderWeight) || 0;
  const totalWetWeight = parseFloat(getTotalWetWeight(data));
  if (totalWetWeight === 0) return "0.0000";
  return (powderWeight / totalWetWeight).toFixed(4);
};

export const getWaterToAddPerUnit = (data: WizardData): string => {
  const powderPerUnit = parseFloat(getPowderPerUnit(data));
  return (1 - powderPerUnit).toFixed(4);
};

// Gram ratio calculations
export const getGramRatioPackedPowderWeight = (data: WizardData): string => {
  const powderPerUnit = parseFloat(getPowderPerUnit(data));
  const staffInput = parseFloat(data.gramRatioStaffInput) || 0;
  return (powderPerUnit * staffInput).toFixed(1);
};

export const getGramRatioWaterToAdd = (data: WizardData): string => {
  const waterToAddPerUnit = parseFloat(getWaterToAddPerUnit(data));
  const staffInput = parseFloat(data.gramRatioStaffInput) || 0;
  return (waterToAddPerUnit * staffInput).toFixed(1);
};

export const getGramRatioPackingTotal = (data: WizardData): string => {
  const packedPowderWeight = parseFloat(getGramRatioPackedPowderWeight(data));
  const waterToAdd = parseFloat(getGramRatioWaterToAdd(data));
  return (packedPowderWeight + waterToAdd).toFixed(1);
};
