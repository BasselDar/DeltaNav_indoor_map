import { ROOM_NAMES } from './roomData';

export const getShortLabelParts = (objectName: string | null): [string, string] => {
  if (!objectName) return ['', ''];
  if (objectName.startsWith('info_')) {
    const num = objectName.replace('info_', '');
    const name = ROOM_NAMES[num] || num;
    const firstWord = name.split(' ')[0];
    return [firstWord, num];
  }
  return [objectName, ''];
};

export const getDisplayName = (objectName: string | null): string => {
  if (!objectName) return '';
  if (objectName.startsWith('info_')) {
    const num = objectName.replace('info_', '');
    return ROOM_NAMES[num] || num;
  }
  return objectName;
};

export const getShortDisplayName = (objectName: string | null): string => {
  if (!objectName) return '';
  if (objectName.startsWith('info_')) {
    const num = objectName.replace('info_', '');
    if (ROOM_NAMES[num]) {
      const match = ROOM_NAMES[num].match(/^(Lab|Hall|Dean|Vice Dean|Secretary|Control|Utilities)/i);
      if (match) return match[0] + (num ? ` ${num}` : '');
      return num;
    }
    return num;
  }
  return objectName;
}; 