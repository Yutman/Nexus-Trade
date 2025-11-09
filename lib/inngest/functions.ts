import {inngest} from "@/lib/inngest/client";
import { NEWS_SUMMARY_EMAIL_PROMPT, PERSONALIZED_WELCOME_EMAIL_PROMPT } from "./prompts";
import {sendWelcomeEmail, sendNewsSummaryEmail} from "@/lib/nodemailer";
import {getAllUsersForNewsEmail} from "@/lib/actions/user.actions";
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions";
import { getNews } from "@/lib/actions/finnhub.actions";
import { getFormattedTodayDate } from "@/lib/utils";


export const sendSignUpEmail = inngest.createFunction(
    { id: 'sign-up-email' },
    { event: 'app/user.created'},
     async ({ event, step }) => {
        const userProfile = `
            - Country: ${event.data.country}
            - Investment goals: ${event.data.investmentGoals}
            - Risk tolerance: ${event.data.riskTolerance}
            - Preferred industry: ${event.data.preferredIndustry}
        `
        const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace('{{userProfile}}', userProfile)

        const response = await step.ai.infer('generate-welcome-intro', {
            model: step.ai.models.gemini({ model: 'gemini-2.5-flash-lite' }),
            body: {
                contents: [
                    {
                        role: 'user',
                        parts: [
                            { text: prompt }
                        ]
                    }]
            }
        })
           await step.run('send-welcome-email', async () => {
            const part = response.candidates?.[0]?.content?.parts?.[0];
            const introText = (part && 'text' in part ? part.text : null) ||'Thanks for joining NexusTrade. You now have the tools to track markets and make smarter moves.'

            const { data: { email, name } } = event;

            return await sendWelcomeEmail({ email, name, intro: introText });
        })

        return {
            success: true, 
            message: 'Welcome email sent successfully'
        }
     }
)

export const sendDailyNewsSummary = inngest.createFunction(
    { id: 'daily-news-summary' },
    [ { event: 'app/send.daily.news' }, { cron: '0 12 * * *' } ],
    async ({ step }) => {
        // Step #1: Get all users for news delivery
        const users = await step.run('get-all-users', getAllUsersForNewsEmail)

        if(!users || users.length === 0) return { success: false, message: 'No users found for news email' };

        // Step #2: For each user, get watchlist symbols -> fetch news (fallback to general)
        const results = await step.run('fetch-user-news', async () => {
            return await Promise.all(
        (users as User[]).map(async (user) => {
            try {
                const symbols = await getWatchlistSymbolsByEmail(user.email);
                let articles = await getNews(symbols);
                articles = (articles || []).slice(0, 6);
                if (!articles || articles.length === 0) {
                    articles = await getNews();
                    articles = (articles || []).slice(0, 6);
                }
                return { user, articles };
            } catch (e) {
                console.error('daily-news: error preparing user news', user.email, e);
                return { user, articles: [] };
            }
        })
    )});

        // Step #3: (placeholder) Summarize news via AI
        const userNewsSummaries = await step.run('summarize-all-news', async () => {
            const summaries: { user: User; newsContent: string | null }[] = [];
            
            for (let i = 0; i < results.length; i++) {
                const { user, articles } = results[i];
                 try {
            const prompt = NEWS_SUMMARY_EMAIL_PROMPT.replace('{{newsData}}', JSON.stringify(articles, null, 2));

            const response = await step.ai.infer(`summarize-news-${i}`, {
                 model: step.ai.models.gemini({ model: 'gemini-2.5-flash-lite' }),
                 body: {
                     contents: [{ role: 'user', parts: [{ text:prompt }]}]
                 }
             });
 
             const part = response.candidates?.[0]?.content?.parts?.[0];
             const newsContent = (part && 'text' in part ? part.text : null) || 'No market news.'

            summaries.push({ user, newsContent });
         } catch (e) {
             console.error('Failed to summarize news for : ', user.email);
           summaries.push({ user, newsContent: null });
         }
     }
    return summaries;
});

        
        // Step #4: (placeholder) Send the emails
        await step.run('send-news-emails', async () => {
                const results = await Promise.allSettled(
                    userNewsSummaries.map(async ({ user, newsContent}) => {
                        if(!newsContent) return null;
                       try {
                await sendNewsSummaryEmail({ email: user.email, date: getFormattedTodayDate(), newsContent });
                return { success: true, email: user.email };
            } catch (error) {
                console.error(`Failed to send email to ${user.email}:`, error);
                return { success: false, email: user.email, error };
            }
                  })
              );

    const successful = results.filter((r: any) => r.status === 'fulfilled' && r.value?.success).length;
    const failed = results.filter((r: any) => r.status === 'rejected' || (r.status === 'fulfilled' && r.value?.success === false)).length;
    console.log(`Email summary: ${successful} sent, ${failed} failed`);
    return { successful, failed };
 })
    })

// Steps implementted are: first I get all emails of users who have enabled news email delivery, 
// then for each user I get their watchlist symbols, 
// then I fetch news for each symbol, 
// then I summarize the news using inngest AI using the gemini-2.5-flash-lite model, 
// then I send the news summary email to the user using nodemailer and return the number of successful and failed emails