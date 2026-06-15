const { h, buildRegexFromComplexString } = require('../utils/regex-builder');

const spreadRegexString = h`
^
  \s*
  (?:\.{3}(?<SPREAD_PROP>[a-zA-Z$_-]+[a-zA-Z$_0-9-\.]*))
  \s*
$
`;
const spreadRegex = buildRegexFromComplexString(spreadRegexString);
function spreadLineProcessor(line = '') {
  let nodeInfo = {};
  const lineMatches = line.match(spreadRegex);
  const lineGroups = lineMatches?.groups;
  const { SPREAD_PROP } = lineGroups || {};
  nodeInfo = {
    lineMatched: !!SPREAD_PROP,
    name: SPREAD_PROP,
    isSpreadOperator: true,
    isNotChild: true,
    isOpened: false,
  };
  return nodeInfo;
}
module.exports = spreadLineProcessor;
