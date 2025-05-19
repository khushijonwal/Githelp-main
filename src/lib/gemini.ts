import { GoogleGenerativeAI } from '@google/generative-ai'
import { Document } from '@langchain/core/documents'
import { generate } from 'node_modules/@langchain/core/dist/utils/fast-json-patch'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash'
})

export const aiSummariseCommit = async(diff: string) => {
    // https://github.com/docker/genai-stack/commit/<commithash>.diff
    const response = await model.generateContent([
        `You are an expert Programmer, and you are trying to summarise a git diff.
Reminder about the git diff format:
For every file, there are a few matadata lines like (for example):
\`\`\`
diff --git a/lib/index.js b/lib/index.js
index aadf691..bfef603 100644
--- a/lib/index.js
+++ b/lib/index.js
\`\`\`
This means that \`lib/index.js\` was modified in this commit. Note that this is only an example.
Then there is a specifier of the lines that were modified.
A line starting with \`+\` means it was added.
A line that starting with \`-\` means that line was deleted.
A line that starts with neither \`+\` nore\`-\` is code given for context and better understanding.
It is not part of the diff.
[...]

EXAMPLE SUMMARY COMMENTS:
\`\`\`
* Raised the amount of returned recordings from \`10\` to \`100\` [packages/server/recording-api.ts], [packages/server/costants.ts]
* Fixed a typo in the github action name [.github/workflows/gpt-commit-summarize.yml]
* Moved the \`octokit\ initialization to a separate file [src/octokit.ts], [src/index.ts]
* Added an OpenAI API for completions [packages/utils/apis/openai.ts]
* Lowered numeric tolerance for test files
\`\`\`

Key guidelines:
\`\`\`
* Be concise and aim for a single bullet point per significant change.
* Include relevant file paths in square brackets \`[]\` when the change is specific to one or two files.
* If more than two files are significantly impacted by a single change, omit the file paths for brevity.
* Focus on the *functional* changes. What does this commit enable or fix?
* Do not include phrases like "This commit...", "Added a...", "Fixed...", etc. Start directly with the action.
* Do not include any parts of the example summaries in your output. ,
\`\`\`



Most commits will have less comments than this examples list.
The last comment does not include the file names,
because there were more than two relevant files in the hypothetical commit.
Do not include parts of the example of appropriate comments.`,
        `Please summarise the following diff file: \n\n${diff}`,
    ]);

    return response.response.text();
}


export async function summariseCode(doc: Document) {
    console.log("getting summary for" , doc.metadata.source);
    try{
        const code = doc.pageContent.slice(0, 10000); 
    const response = await model.generateContent([
            `You are an intelligent senior software engineer who specialises in onboarding junior software engineers onto projects, Your are an expert in answer the questions of junior intern related to the software engineering Domain, Your are kind, intelligent and Knowledgeable`,
            `You are onboarding a junior software engineer and explaining to them the purpose of the ${doc.metadata.source} file and answering all of their question very correctly and precisely, If the question is asking about code or a specific file, AI will provide the detailed answer, giving step by step instructions, including code snippets`,`
            
Here is the code:
----
${code}
---
            Give a summary no more than 100 words of th code above`,
    ]);

     return response.response.text()

     } catch (error) {
        return ''

     }

}

export async function generateEmbedding(summary: string) {
    const model = genAI.getGenerativeModel({
        model: "text-embedding-004"
    })
    const result = await model.embedContent(summary)
    const embedding = result.embedding
    return embedding.values
}

console.log(await generateEmbedding("hello World"))
