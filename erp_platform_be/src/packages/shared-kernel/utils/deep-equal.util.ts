import equal from 'fast-deep-equal';

export const deepEqual = <T>(left: T, right: T): boolean => {
  return equal(left, right);
};
