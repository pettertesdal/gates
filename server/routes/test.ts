import sql from 'mssql';

export default defineEventHandler(async (event) => {
  let projects;
  try {
    console.log("Starting...");
    projects = await connectAndQuery("SELECT * FROM projectModel WHERE ID = 1;");

  } catch (error) {
    // Handle error, for example, by returning an error status and message
    return createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: 'Failed to retrieve records.',
    });
  }

  return {
    hello: 'world',
    data: projects
  }
})
