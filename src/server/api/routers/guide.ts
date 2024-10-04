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
    return ctx.db.guide.findMany({
      orderBy: { createdAt: "desc" },
      take: 50, // Limit to 50 guides, adjust as needed
    });
  }),

  create: publicProcedure
    .input(z.object({ title: z.string(), description: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Replace with actual user ID once authentication is implemented
      const createdBy = "placeholder-user-id";

      console.log("Attempting to create guide:", input);

      try {
        const result = await ctx.db.guide.create({
          data: {
            title: input.title,
            description: input.description,
            createdBy,
          },
        });
        console.log("Guide created successfully:", result);
        return result;
      } catch (error) {
        console.error("Error creating guide:", error);
        throw error;
      }
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const guide = await ctx.db.guide.findUnique({
        where: { id: input.id },
      });
      if (!guide) {
        throw new Error("Guide not found");
      }
      return guide;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updatedGuide = await ctx.db.guide.update({
        where: { id: input.id },
        data: {
          title: input.title,
          description: input.description,
        },
      });
      return updatedGuide;
    }),
});
