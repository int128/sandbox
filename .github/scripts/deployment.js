const sleep = msec => new Promise(resolve => setTimeout(resolve, msec))

const createDeployment = async (github, context, core, microservice) => {
  const { data: deployment } = await github.repos.createDeployment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    ref: context.payload.pull_request.head.ref,
    environment: `pr-${context.issue.number}-${microservice}`,
    required_contexts: [],
    auto_merge: false,
  })
  core.info(JSON.stringify(deployment, undefined, 2))

  const createDeploymentStatus = {
    owner: context.repo.owner,
    repo: context.repo.repo,
    deployment_id: deployment.id,
    mediaType: {
      previews: ['flash'],
    },
  }

  await sleep(5000 * Math.random())
  await github.repos.createDeploymentStatus({
    ...createDeploymentStatus,
    state: 'queued',
    description: 'Waiting for Argo CD polling',
    target_url: `https://argocd.example.com/pr-${context.issue.number}-${microservice}`,
  })

  await sleep(5000 * Math.random())
  await github.repos.createDeploymentStatus({
    ...createDeploymentStatus,
    state: 'pending',
    description: 'Argo CD is syncing',
    target_url: `https://argocd.example.com/pr-${context.issue.number}-${microservice}`,
  })

  await sleep(5000 * Math.random())
  await github.repos.createDeploymentStatus({
    ...createDeploymentStatus,
    state: 'in_progress',
    description: 'Waiting for ready',
    target_url: `https://argocd.example.com/pr-${context.issue.number}-${microservice}`,
  })

  await sleep(5000 * Math.random())
  await github.repos.createDeploymentStatus({
    ...createDeploymentStatus,
    state: 'success',
    description: 'Application is ready',
    target_url: `https://pr-${context.issue.number}-${microservice}.example.com`,
  })
}

module.exports = async ({ github, context, core }) => {
  await Promise.all(
    createDeployment(github, context, core, 'frontend'),
    createDeployment(github, context, core, 'backend'),
    createDeployment(github, context, core, 'gateway'),
    createDeployment(github, context, core, 'payment'),
    createDeployment(github, context, core, 'authentication'),
    createDeployment(github, context, core, 'support'),
  )
}
