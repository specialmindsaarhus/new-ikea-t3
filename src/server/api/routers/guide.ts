import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const guideRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.guide.findMany();
  }),

  create: publicProcedure
    .input(z.object({ title: z.string(), description: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Replace with actual user ID once authentication is implemented
      const createdBy = "placeholder-user-id";

      return ctx.db.guide.create({
        data: {
          title: input.title,
          description: input.description,
          createdBy,
        },
      });
    }),
});
