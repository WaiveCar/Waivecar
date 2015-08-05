fdescribe('State service', function() {
  var mockState = {
    go: jasmine.createSpy('go')
  }
  beforeEach(function() {
    var self = this;
    angular.mock.module('State', function($provide) {
      $provide.value("$state", mockState);

    });
    angular.mock.inject(function(StateService) {
      self.service = StateService;
    });
  });
  it('Should be able to initialize a state flow', function() {
    var flowName = 'testFlow';
    var states = [
			{
  name: 'first',
			},
			
		];
    this.service.setStateFlow(flowName, states);

    expect(this.service._flows[flowName].states).toEqual(states);
  });
  it('Should not be able to have a state with the same name', function() {
    var flowName = 'testFlow';
    var states = [
			{
  name: 'first',
			},
			{
  name: 'first'
			}
			
		];
    var self = this;
    expect(function() { 		self.service.setStateFlow(flowName, states);}).toThrow(new Error('The state ' + states[0].name + ' already exists'));
  });
  describe('State flow', function() {
    var flowName = 'testFlow';
    var rules = [
			{
  name: 'first',
  rules: {
    arrive: function(fromStte) {

    },
    leave: function(nextState) {

    }
  }
			},
			{
  name: 'second'
			},
			{
  name: 'last'
			}
			
		];
    beforeEach(function() {
      this.service.setStateFlow(flowName, rules);
    })	

    it('The flow should start on the first state', function() {
      var currentState = this.service.getCurrentState(flowName);
      expect(currentState).toEqual(rules[0].name);

    });
    it('The user can skip to a given state', function() {
      var expectedName = rules[1].name;
      this.service.goTo(flowName, expectedName);
      var currentState = this.service.getCurrentState(flowName);
      expect(currentState).toEqual(expectedName);
      expect(mockState.go).toHaveBeenCalledWith(expectedName);
    })
    it('The user can go to the next stage if it\'s not the last');
    it('The user can go to the previous state if it\s not the first');
    describe('Flow rules', function() {
      it('Can set rules to a state flow');
      it('Can\'t arrive at a state if the rule doesn\'t allow');
      it('Can\'t go to the next state if the rule doesn\'t allow');
      it('Can\'t go to the previous state if the rule doesn\'t allow');

    });
  });
});