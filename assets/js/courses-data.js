/* 课程笔记静态清单。
 * 讲义 PDF 是站点资源（assets/courses/<courseId>/），页数为构建时核对的真实页数。
 * 批注等用户数据存 localStorage（gushibu.courses.v1），与本清单分离。 */
window.COURSES_MANIFEST = {
  version: 1,
  courses: [
    {
      id: 'mathstat',
      title: '数理统计',
      subtitle: 'Mathematical Statistics',
      description:
        '《数理统计》课程讲义，共 10 讲，内容基于 Casella & Berger《Statistical Inference》。',
      lectures: [
        { id: 'L01', title: 'Introduction', file: 'assets/courses/mathstat/Lecture01.pdf', pages: 68 },
        { id: 'L02', title: 'Principles of Data Reduction', file: 'assets/courses/mathstat/Lecture02.pdf', pages: 75 },
        { id: 'L03', title: 'Estimation Methods', file: 'assets/courses/mathstat/Lecture03.pdf', pages: 105 },
        { id: 'L04', title: 'Hypothesis Testing', file: 'assets/courses/mathstat/Lecture04.pdf', pages: 78 },
        { id: 'L05', title: 'Interval Estimation', file: 'assets/courses/mathstat/Lecture05.pdf', pages: 36 },
        { id: 'L06', title: 'Bayesian Method', file: 'assets/courses/mathstat/Lecture06.pdf', pages: 44 },
        { id: 'L07', title: 'Statistical Decision', file: 'assets/courses/mathstat/Lecture07.pdf', pages: 37 },
        { id: 'L08', title: 'Analysis of Variance', file: 'assets/courses/mathstat/Lecture08.pdf', pages: 45 },
        { id: 'L09', title: 'Linear Models I', file: 'assets/courses/mathstat/Lecture09.pdf', pages: 59 },
        { id: 'L10', title: 'Linear Models II', file: 'assets/courses/mathstat/Lecture10.pdf', pages: 78 },
      ],
    },
  ],
};
