function generatePermutation(arr) {
  let resultArr = [];
  if (arr.length === 0) return [];
  if (arr.length === 1) return [arr];

  for (let i = 0; i < arr.length; i++) {
    const currentElement = arr[i];

    const otherElements = arr.slice(0, i).concat(arr.slice(i + 1));
    const swappedPermutation = generatePermutation(otherElements);

    for (let j = 0; j < swappedPermutation.length; j++) {
      const finalSwappedPermutation = [currentElement].concat(swappedPermutation[j]);

      resultArr.push(finalSwappedPermutation);
    }
  }

  return resultArr;
}
export default generatePermutation;
