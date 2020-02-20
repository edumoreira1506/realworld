const userFactory = overrideProps => ({
  email: 'teste@email.com',
  username: 'username',
  password: 'password',
  bio: 'bio here',
  ...overrideProps
});

module.exports = userFactory;
