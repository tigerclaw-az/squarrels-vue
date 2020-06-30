/** **
 * Contributed from https://github.com/bellstrand/mongoose-seed-db
 ****/
const mongoose = require('mongoose');
const read = require('fs-readdir-recursive');

class MongooseSeed {
	constructor(opts = {}) {
		mongoose.set('debug', opts.debug || process.env.MONGOOSE_DEBUG || false);
		mongoose.set('useUnifiedTopology', true);
		mongoose.Promise = opts.Promise || global.Promise;
		this.logger = opts.logger || null;
	}

	connect(db, options) {
		return new Promise((resolve, reject) => {
			mongoose.connect(db, options).then(() => {
				if (this.logger) {
					this.logger.info(`mongodb connected: ${db}`);
				}

				resolve();
			})
				.catch(error => {
					reject(error);
				});
		});
	}

	loadModels(path) {
		const files = read(path);

		this.models = [];
		files.forEach(file => {
			if (~file.indexOf('.js')) {
				const model = require(path + '/' + file);

				this.models.push((model.default || model).modelName);
			}
		});

		if (this.logger) {
			this.logger.info('Loaded models: ', this.models);
		}
	}

	populate(path, options = {}) {
		options = Object.assign({
			populateExisting: true,
		}, options);

		return new Promise(async resolve => {
			const files = read(path);

			if (this.logger) {
				this.logger.info(`Loading data from: ${files}`);
			}

			this.data = [];
			files.forEach(file => {
				if (~file.indexOf('.js') || ~file.indexOf('.json')) {
					this.data.push(require(path + '/' + file));
				}
			});

			if (this.logger) {
				this.logger.info('Populating collections: ', this.data.map(collection => collection.model));
			}

			for (const collection of this.data) {
				const Model = mongoose.model(collection.model);

				const documents = await Model.countDocuments({});

				if (options.populateExisting || (!options.populateExisting && !documents)) {
					if (this.logger) {
						this.logger.info(`Populating ${collection.model} with ${collection.data.length} entries`);
					}

					for (const entry of collection.data) {
						await Model.create(entry);
					}
				} else if (this.logger) {
					this.logger.warn(`Model ${collection.model} has ${documents} existing entries, not populating`);
				}
			}

			if (this.logger) {
				this.logger.info('Population Done!');
			}

			resolve();
		});
	}

	clearAll() {
		return this.clearModels(this.models);
	}

	clearModels(models) {
		if (this.logger) {
			this.logger.info('Clearing collections: ', models);
		}

		return new Promise(async resolve => {
			for (const modelName of models) {
				const Model = mongoose.model(modelName);

				await Model.remove({});
				resolve();
			}
		});
	}
}

module.exports = (options = {}) => {
	return new MongooseSeed(options);
};
