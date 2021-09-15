const sleep = msec => new Promise(resolve => setTimeout(resolve, msec))

const getOrCreateDeployment = async (github, context, core, environment) => {
  const { data: deploymentList } = await github.repos.listDeployments({
    owner: context.repo.owner,
    repo: context.repo.repo,
    ref: context.payload.pull_request.head.ref,
    environment,
    per_page: 1,
  })
  if (deploymentList.length > 0) {
    return deploymentList[0]
  }

  const { data: deployment } = await github.repos.createDeployment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    ref: context.payload.pull_request.head.ref,
    environment,
    required_contexts: [],
    auto_merge: false,
  })
  core.info(JSON.stringify(deployment, undefined, 2))
  return deployment
}

const createDeploymentForMicroservice = async (github, context, core, microservice) => {
  const deployment = await getOrCreateDeployment(github, context, core, `pr-${context.issue.number}-${microservice}`)
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
  await Promise.all([
    createDeploymentForMicroservice(github, context, core, 'frontend'),
    createDeploymentForMicroservice(github, context, core, 'backend'),
    createDeploymentForMicroservice(github, context, core, 'gateway'),
    createDeploymentForMicroservice(github, context, core, 'payment'),
    createDeploymentForMicroservice(github, context, core, 'authentication'),
    createDeploymentForMicroservice(github, context, core, 'support'),
  ])
}
