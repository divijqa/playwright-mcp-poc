module.exports = {
  default: {
    formatOptions: { snippetInterface: 'async-await' },
    requireModule: ['ts-node/register'],
    require: ['features/step_definitions/**/*.ts'],
    paths: ['features/**/*.feature']
  },
};
