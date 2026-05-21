const avatarModules = import.meta.glob('../images/avatars/*', {
  eager: true,
  query: '?url',
  import: 'default'
});

const avatarMap = Object.fromEntries(
  Object.entries(avatarModules).map(([path, url]) => {
    const filename = path.split('/').at(-1);
    return [`avatars/${filename}`, url];
  })
);

export const resolveAvatar = (avatarUrl) => {
  if (!avatarUrl) return '';
  return avatarMap[avatarUrl] || avatarUrl;
};
