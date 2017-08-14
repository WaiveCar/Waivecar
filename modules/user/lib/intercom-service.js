'use strict';

module.export = class IntercomeService {

    /**
     * Generates, stores, and returns a some var.
     * @param  {String} str
     * @return {String} res
     */
    static *mymethod(str){
        let res = str + ' ' + str;
        yield res;
        return res;
    }
};