export default defineEventHandler(async event => {
  try {
    // gjør klar body
    const body = await readBody(event);
    const { taskID, newProgress } = body;

    if (!taskID || !newProgress) {
      // Sender en error hvis requesten er feil
      return createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: 'taskID and newProgress must be provided',
      });
    }

    // logging
    console.log(`Attempting to update task ${taskID} with new progress ${newProgress}`);

    // Update the task in the database
    await connectAndQuery(`UPDATE taskModel SET progress = ${newProgress} WHERE ID = ${taskID}`);

    // Return success response
    return { updated: true };
  } catch (error) {
    // If there's an error during the database operation, return an internal server error
    console.error('Failed to update the task:', error);
    return createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: 'Failed to update the task',
    });
  }
});

