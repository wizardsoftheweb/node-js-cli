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
    it("should expose options", (): void => {
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

    describe("The factory must provide updateOption", (): void => {
        it("should expose updateOption", (): void => {
            @HasOptions()
            class DecoratedClass {
                constructor() {
                    // do nothing
                }
            }
            const decorated: any = new DecoratedClass();
            decorated.should.respondTo("updateOption");
        });
        it("should update options", (): void => {
            @HasOptions()
            class DecoratedClass {
                public options = { defaults: { one: "two" }, one: "two" };
                constructor() {
                    // do nothing
                }
            }
            const decorated: any = new DecoratedClass();
            decorated.options.one.should.equal("two");
            decorated.updateOption("one", "three");
            decorated.options.one.should.equal("three");
        });
    });

    describe("The factory must provide resetOptions", (): void => {
        it("should expose resetOptions", (): void => {
            @HasOptions()
            class DecoratedClass {
                constructor() {
                    // do nothing
                }
            }
            const decorated: any = new DecoratedClass();
            decorated.should.respondTo("resetOptions");
        });
        it("should wipe options", (): void => {
            @HasOptions()
            class DecoratedClass {
                public options = { defaults: { one: "two" }, one: "three" };
                constructor() {
                    // do nothing
                }
            }
            const decorated: any = new DecoratedClass();
            decorated.options.one.should.equal("three");
            decorated.resetOptions();
            decorated.options.one.should.equal("two");
        });
        it("should handle missing options", (): void => {
            @HasOptions()
            class DecoratedClass {
                constructor() {
                    // do nothing
                }
            }
            const decorated: any = new DecoratedClass();
            delete decorated.options;
            should.not.exist(decorated.options);
            decorated.resetOptions();
            should.exist(decorated.options);
        });
    });
});
/* tslint:enable:max-classes-per-file */
