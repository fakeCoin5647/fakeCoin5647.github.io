window.COURSES_MANIFEST = {
  "version": 1,
  "courses": [
    {
      "id": "papers",
      "title": "论文精读",
      "subtitle": "异构集群调度",
      "description": "从显存分块到未知长度调度。选择一篇进入中文逐步讲解，在对应步骤打开原文并手写批注。",
      "lectures": [
        {
          "id": "paged",
          "title": "PagedAttention · 从注意力到显存分块",
          "file": "assets/papers/01-PagedAttention.pdf",
          "pages": 16
        },
        {
          "id": "dist",
          "title": "DistServe · 分开预填充与解码",
          "file": "assets/papers/03-DistServe.pdf",
          "pages": 19
        },
        {
          "id": "gavel",
          "title": "Gavel：把设备差异写进调度模型",
          "file": "assets/papers/02-Gavel.pdf",
          "pages": 19
        },
        {
          "id": "gittins",
          "title": "Gittins 调度与平均响应时间",
          "file": "assets/papers/04-Gittins.pdf",
          "pages": 10
        },
        {
          "id": "wait",
          "title": "Nested WAIT 与未知长度下的显存约束",
          "file": "assets/papers/05-Nested-WAIT.pdf",
          "pages": 79
        }
      ]
    }
  ]
};
