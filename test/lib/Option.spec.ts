// Things like ...be.true; or ...be.rejected; dont play nice with TSLint
/* tslint:disable:no-unused-expression */
import * as chai from "chai";
// Needed for describe, it, etc.
import { } from "mocha";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";

const should = chai.should();
chai.use(sinonChai);

import { Option } from "../../src/lib/Option";

// This is a decorator, so we have to test lots of classes.
/* tslint:disable:max-classes-per-file */
describe("Option", (): void => {
    describe("The factory should handle any options", (): void => {
        it("should create options when DNE", (): void => {
            class DecoratedClass {
                @Option("four")
                public three: string;
            }
            const decorated: any = new DecoratedClass();
            decorated.should.have.property("options");
            decorated.options.should.have.property("defaults");
            decorated.options.should.have.property("three");
            decorated.options.defaults.should.have.property("three");
        });

        it("should add to existing options", (): void => {
            class SuperClass {
                @Option("two")
                public one: string;
            }
            class DecoratedClass extends SuperClass {
                @Option("four")
                public three: string;
            }
            const decorated: any = new DecoratedClass();
            decorated.should.have.property("options");
            decorated.options.should.have.property("defaults");
            decorated.options.should.have.property("one");
            decorated.options.defaults.should.have.property("one");
            decorated.options.should.have.property("three");
            decorated.options.defaults.should.have.property("three");
        });
    });

    describe("The factory should handle any default value", (): void => {
        it("should handle an explicit value", (): void => {
            class DecoratedClass {
                @Option("four")
                public three: string;
            }
            const decorated: any = new DecoratedClass();
            decorated.should.have.property("options");
            decorated.options.should.have.property("defaults");
            decorated.options.should.have.property("three");
            decorated.options.defaults.should.have.property("three");
            decorated.options.defaults.three.should.equal("four");
        });
        it("should handle a missing value", (): void => {
            class DecoratedClass {
                @Option()
                public three: string;
            }
            const decorated: any = new DecoratedClass();
            decorated.should.have.property("options");
            decorated.options.should.have.property("defaults");
            decorated.options.should.have.property("three");
            decorated.options.defaults.should.have.property("three");
            should.equal(decorated.options.defaults.three, null);
        });
    });
});
/* tslint:enable:max-classes-per-file */
