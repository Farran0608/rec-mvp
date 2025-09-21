export function canonicalize(input: any): string {
  function sortDeep(o: any): any {
    if (Array.isArray(o)) return o.map(sortDeep);
    if (o && typeof o === "object" && o.constructor === Object) {
      return Object.keys(o).sort().reduce((acc: any, k: string) => (acc[k]=sortDeep(o[k]), acc), {});
    }
    return o;
  }
  return JSON.stringify(sortDeep(input));
}
