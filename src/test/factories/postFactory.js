const postFactory = overrideProps => ({
  title: 'Title here!',
  content: 'content...',
  ...overrideProps
});

module.exports = postFactory;
