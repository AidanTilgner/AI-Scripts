export const formatTitleIntoFileName = (title) => {
  // title looks like "Hello World in Python" and should look like "hello-world-in-python"
  const formattedTitle = title.toLowerCase().split(" ").join("-");
  return formattedTitle;
};
