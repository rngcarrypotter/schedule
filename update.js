const { Octokit } = require("@octokit/rest");
const fs = require("fs");

const octokit = new Octokit({
    auth: process.env.GH_TOKEN,
});

const owner = "rngcarrypotter";
const repo = "schedule";

async function updateFile(path, message, content) {
    try {
        const { data: { sha } } = await octokit.repos.getContent({
            owner,
            repo,
            path,
        });

        await octokit.repos.createOrUpdateFileContents({
            owner,
            repo,
            path,
            message,
            content: Buffer.from(content).toString('base64'),
            sha,
        });
    } catch (error) {
        if (error.status === 404) {
            await octokit.repos.createOrUpdateFileContents({
                owner,
                repo,
                path,
                message,
                content: Buffer.from(content).toString('base64'),
            });
        } else {
            throw error;
        }
    }
}

(async () => {
    const timetableContent = fs.readFileSync("timetable.json", "utf8");
    await updateFile("timetable.json", "Update timetable", timetableContent);

    const menuPlanContent = fs.readFileSync("menuPlan.json", "utf8");
    await updateFile("menuPlan.json", "Update menu plan", menuPlanContent);
})();
