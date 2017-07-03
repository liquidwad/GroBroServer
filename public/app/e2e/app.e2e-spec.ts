import { GrobroAppPage } from './app.po';

describe('grobro-app App', () => {
  let page: GrobroAppPage;

  beforeEach(() => {
    page = new GrobroAppPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
