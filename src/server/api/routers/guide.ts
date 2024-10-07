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
      const guide = await ctx.db.guide.findFirstOrThrow({
        where: { id: input.id },
        include: { steps: true }, // Include steps if you need them
      });
      return guide;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updatedGuide = await ctx.db.guide.update({
        where: { id: input.id },
        data: {
          title: input.title,
          description: input.description,
          imageUrl: input.imageUrl,
        },
      });
      return updatedGuide;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const deletedGuide = await ctx.db.guide.delete({
        where: { id: input.id },
      });
      return deletedGuide;
    }),

  // Get steps for a guide
  getSteps: publicProcedure
    .input(z.object({ guideId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.step.findMany({
        where: { guideId: input.guideId },
        orderBy: { orderNumber: "asc" },
      });
    }),
  addStep: publicProcedure
    .input(
      z.object({
        guideId: z.string(),
        description: z.string(),
        imageUrl: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const lastStep = await ctx.db.step.findFirst({
        where: { guideId: input.guideId },
        orderBy: { orderNumber: "desc" },
      });

      const newOrderNumber = lastStep ? lastStep.orderNumber + 1 : 1;

      const data: any = {
        guideId: input.guideId,
        description: input.description,
        orderNumber: newOrderNumber,
      };

      if (input.imageUrl !== undefined) {
        data.imageUrl = input.imageUrl;
      }

      return ctx.db.step.create({ data });
    }),

  updateStep: publicProcedure
    .input(
      z.object({
        id: z.string(),
        description: z.string(),
        imageUrl: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const data: any = {
        description: input.description,
      };

      if (input.imageUrl !== undefined) {
        data.imageUrl = input.imageUrl;
      }

      return ctx.db.step.update({
        where: { id: input.id },
        data,
      });
    }),
  // Delete a step
  deleteStep: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const stepToDelete = await ctx.db.step.findUnique({
        where: { id: input.id },
        select: { guideId: true, orderNumber: true },
      });

      if (!stepToDelete) {
        throw new Error("Step not found");
      }

      await ctx.db.step.delete({ where: { id: input.id } });

      // Reorder remaining steps
      await ctx.db.step.updateMany({
        where: {
          guideId: stepToDelete.guideId,
          orderNumber: { gt: stepToDelete.orderNumber },
        },
        data: {
          orderNumber: { decrement: 1 },
        },
      });

      return { success: true };
    }),

  // Reorder steps
  reorderSteps: publicProcedure
    .input(
      z.object({
        guideId: z.string(),
        stepIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updates = input.stepIds.map((id, index) =>
        ctx.db.step.update({
          where: { id },
          data: { orderNumber: index + 1 },
        }),
      );

      await ctx.db.$transaction(updates);

      return { success: true };
    }),
});
