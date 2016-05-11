describe('Test Homepage', function() {
  it('should have a title', function() {
    browser.get('http://localhost');
      expect(browser.getTitle()).toEqual('Madagascar');
  });
});
