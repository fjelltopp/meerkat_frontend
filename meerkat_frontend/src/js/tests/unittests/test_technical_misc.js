describe("Calc Percent", function() {
  it("Get correct percent", function() {
      expect(calc_percent(1, 10)).toBe(10);
  });
  it("Get correct percent with rounding", function() {
      expect(calc_percent(1, 7)).toBe(14);
  });
  it("Deal with zero denominator", function() {
      expect(calc_percent(1, 0)).toBe(0);
  });
});
