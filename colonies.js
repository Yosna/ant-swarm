import Colony from './classes/colony.js';
import Ant from './classes/ant.js';
import { resources } from './index.js';

const colonies = {
    garden: new Colony('Garden', 'garden-colony', resources.food, 0),

    updateReferences: (references) => {
        for (const colony in colonies) {
            if (colonies[colony] instanceof Colony) {
                const resource = references[colonies[colony].resource.name];
                colonies[colony].assignReferences(resource);
            }
        }
    }
};

function * iterateColonies() {
    for (const iteration of Object.values(colonies)) {
        if (iteration instanceof Colony) {
            yield * iterateAnts(iteration);
            yield iteration;
        }
    }
}

function * iterateAnts(colony) {
    for (const iteration of Object.values(colony)) {
        if (iteration instanceof Ant) {
            yield iteration;
        }
    }
}

const getAntByName = (target) => {
    for (const iteration of iterateColonies(colonies)) {
        if (iteration.name === target) {
            return iteration;
        }
    }
};

const colonyProgression = () => {
    for (const iteration of iterateColonies()) {
        if (iteration instanceof Colony || Ant) {
            iteration.progression();
        }
    }
};

export {
    colonies,
    iterateColonies,
    getAntByName,
    colonyProgression
};
