const { shellCommand, memoize } = require('cerebro-tools');

const KARABINER = '/Applications/Karabiner.app/Contents/Library/bin/karabiner ';
const APP_ICON = '/Applications/Karabiner.app/Contents/Resources/app.icns';

const MEMOIZE_OPTIONS = {
  promise: 'then',
  maxAge: 5 * 1000,
  preFetch: true
}

const listProfiles = memoize(() => {
  return shellCommand(KARABINER + 'list').then(result => (
    result
      .split('\n')
      .filter(l => l != '')
      .map(str => {
        const [id, name] = str.match(/(\d+)\:\s+(.*)/).slice(1);
        return { id, name };
      })
    )
  )
}, MEMOIZE_OPTIONS);

const plugin = (scope) => {
  const match = scope.term.match(/^karabiner\s/);
  if (match) {
    listProfiles().then(list => {
      const results = list.map(({id, name}) => ({
        id,
        title: `Switch to ${name}`,
        icon: APP_ICON,
        subtitle: `Switch Karabiner profile to ${name}`,
        onSelect: () => shellCommand(KARABINER + `select ${id}`)
      }));
      scope.display(results);
    });
  };
}

module.exports = {
  fn: plugin,
  keyword: 'karabiner',
  name: 'Switch Karabiner Profiles'
}
