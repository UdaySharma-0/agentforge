const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const auth = require("../middlewares/auth.middleware");
const Log = require("../models/log");

router.get("/", auth, async (req, res) => {
  try {
    const requestedPage = Number.parseInt(req.query.page, 10);
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const sortBy = String(req.query.sortBy || "time");
    const sortOrder = String(req.query.sortOrder || "desc");
    const page = Number.isNaN(requestedPage) || requestedPage < 1 ? 1 : requestedPage;
    const limit =
      Number.isNaN(requestedLimit) || requestedLimit < 1
        ? 20
        : Math.min(requestedLimit, 50);
    const skip = (page - 1) * limit;
    const order = sortOrder === "asc" ? 1 : -1;

    const sortConfig =
      sortBy === "agent"
        ? { agentSortName: order, createdAt: -1 }
        : sortBy === "channel"
          ? { channelSortValue: order, createdAt: -1 }
          : { createdAt: order };

    const matchStage = {
      userId: new mongoose.Types.ObjectId(req.user.id),
    };

    const logsPipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "agents",
          localField: "agentId",
          foreignField: "_id",
          as: "agent",
        },
      },
      {
        $unwind: {
          path: "$agent",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "whatsappintegrations",
          let: { currentAgentId: "$agentId", currentUserId: "$userId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$agentId", "$$currentAgentId"] },
                    { $eq: ["$businessId", "$$currentUserId"] },
                    { $eq: ["$isActive", true] },
                  ],
                },
              },
            },
            { $limit: 1 },
          ],
          as: "whatsappIntegration",
        },
      },
      {
        $lookup: {
          from: "emailintegrations",
          let: { currentAgentId: "$agentId", currentUserId: "$userId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$agentId", "$$currentAgentId"] },
                    { $eq: ["$businessId", "$$currentUserId"] },
                    { $eq: ["$isActive", true] },
                  ],
                },
              },
            },
            { $limit: 1 },
          ],
          as: "emailIntegration",
        },
      },
      {
        $addFields: {
          inferredChannel: {
            $ifNull: [
              "$channel",
              {
                $cond: [
                  { $gt: [{ $size: "$whatsappIntegration" }, 0] },
                  "whatsapp",
                  {
                    $cond: [
                      { $gt: [{ $size: "$emailIntegration" }, 0] },
                      "email",
                      "chatbot",
                    ],
                  },
                ],
              },
            ],
          },
          agentSortName: { $ifNull: ["$agent.name", ""] },
          channelSortValue: {
            $ifNull: [
              "$channel",
              {
                $cond: [
                  { $gt: [{ $size: "$whatsappIntegration" }, 0] },
                  "whatsapp",
                  {
                    $cond: [
                      { $gt: [{ $size: "$emailIntegration" }, 0] },
                      "email",
                      "chatbot",
                    ],
                  },
                ],
              },
            ],
          },
          agentId: {
            _id: "$agent._id",
            name: "$agent.name",
          },
        },
      },
      {
        $addFields: {
          channel: "$inferredChannel",
        },
      },
      { $sort: sortConfig },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          agent: 0,
          agentSortName: 0,
          channelSortValue: 0,
          inferredChannel: 0,
          whatsappIntegration: 0,
          emailIntegration: 0,
        },
      },
    ];

    const [logs, total] = await Promise.all([
      Log.aggregate(logsPipeline),
      Log.countDocuments(matchStage),
    ]);

    const loadedCount = skip + logs.length;

    res.json({
      success: true,
      logs,
      page,
      limit,
      total,
      sortBy,
      sortOrder: order === 1 ? "asc" : "desc",
      hasMore: loadedCount < total,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.get("/agent/:agentId", auth, async (req, res) => {
  try {
    const logs = await Log.find({
      agentId: req.params.agentId,
      userId: req.user.id,
    })
      .populate("agentId", "name")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      logs,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;
