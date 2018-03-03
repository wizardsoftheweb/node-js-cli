// Things like ...be.true; or ...be.rejected; dont play nice with TSLint
/* tslint:disable:no-unused-expression */
import * as chai from "chai";
// Needed for describe, it, etc.
import { } from "mocha";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";

const should = chai.should();
chai.use(sinonChai);

import { HasOptions } from "../../src/lib/HasOptions";

// This is a decorator, so we have to test lots of classes.
/* tslint:disable:max-classes-per-file */
describe("HasOptions", (): void => {
    describe("The factory should expose winston", (): void => {
        it("The factory should expose winston", (): void => {
            @HasOptions()
            class DecoratedClass {
                constructor() {
                    // do nothing
                }
            }
            const decorated: any = new DecoratedClass();
            decorated.should.have.property("options");
            decorated.options.should.have.property("defaults");
        });
    });
});
/* tslint:enable:max-classes-per-file */
