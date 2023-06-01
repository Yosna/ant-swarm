import Decimal from '../classes/decimal.mjs';
import Ant from './ant.js';
import number from '../utilities/number.js';
import dom from '../utilities/dom.js';

class Colony {
    constructor(colony, id, resource, colonyTier) {
        this.name = colony;
        this.id = id;
        this.resource = resource;
        this.tier = colonyTier;
        this.validation = 'Colony';

        // Ant Parameters = new Ant(
        //     <ant name>, <colony name>,
        //     <resource>, <product>, <colony tier>, <ant tier>
        // );
        this.smallWorker = new Ant(
            'Small ' + colony + ' Worker', colony,
            resource, resource, colonyTier, 0
        );
        this.regularWorker = new Ant(
            'Regular ' + colony + ' Worker', colony,
            resource, this.smallWorker, colonyTier, 1
        );
        this.largeWorker = new Ant(
            'Large ' + colony + ' Worker', colony,
            resource, this.regularWorker, colonyTier, 2
        );
        this.smallDrone = new Ant(
            'Small ' + colony + ' Drone', colony,
            resource, this.largeWorker, colonyTier, 3
        );
        this.regularDrone = new Ant(
            'Regular ' + colony + ' Drone', colony,
            resource, this.smallDrone, colonyTier, 4
        );
        this.largeDrone = new Ant(
            'Large ' + colony + ' Drone', colony,
            resource, this.regularDrone, colonyTier, 5
        );
        this.queen = new Ant(
            colony + ' Queen', colony,
            resource, this.largeDrone, colonyTier, 6
        );
    }

    static fromObject(save) {
        const colony = new Colony(
            save.name,
            save.id,
            save.resource,
            save.tier
        );
        for (const data in save) {
            if (save[data].validation === Ant.name) {
                colony[data] = Ant.fromObject(save[data]);
            }
        }
        return colony;
    }

    get acquired() {
        let total = new Decimal(0);
        for (const iteration of Object.values(this)) {
            if (iteration instanceof Ant) {
                total = total.plus(iteration.acquired);
            }
        }
        return number(total.floor());
    }

    get resourceGeneration() {
        const resourceGenerator = this.smallWorker.production;
        return number(resourceGenerator.total);
    }

    get elements() {
        const elements = {
            statAcquiredTotal: {
                selector: `#${this.id}-colony-total`,
                property: 'innerHTML',
                value: this.acquired
            },
            colonyResourceProduction: {
                selector: `#${this.resource.name}-production`,
                property: 'innerHTML',
                value: this.resourceGeneration
            }
        };
        return elements;
    }

    assignReferences(resource) {
        this.resource = resource;
        const references = [
            this.resource,
            this.smallWorker,
            this.regularWorker,
            this.largeWorker,
            this.smallDrone,
            this.regularDrone,
            this.largeDrone,
            this.queen
        ];

        for (let i = 0; i < references.length; i++) {
            const iteration = references[i];
            if (iteration instanceof Ant) {
                iteration._product = references[i - 1];
            }
            if (iteration !== this.resource) {
                iteration.resource = this.resource;
            }
        }
    }

    toggleStatSubentries() {
        const element = dom.getElement(`#${this.id}-subentries`);
        const arrow = dom.getElement(`#${this.id}-arrow`);

        element.classList.toggle('collapse');
        arrow.classList.toggle('rotate');
    }

    progression() {
        dom.updateElements(this.elements);
    }
}

export default Colony;
