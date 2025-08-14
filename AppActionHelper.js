// AppActionHelper.js
global.isPerformingAction = false;

export const runWithoutKill = async callback => {
  global.isPerformingAction = true;
  try {
    await callback();
  } catch (error) {
    console.error(error);
  } finally {
    global.isPerformingAction = false;
  }
};
