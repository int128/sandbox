const sleep = msec => new Promise(resolve => setTimeout(resolve, msec))

const rereateDeployment = async (github, context, core, environment) => {
  const { data: deploymentList } = await github.repos.listDeployments({
    owner: context.repo.owner,
    repo: context.repo.repo,
    ref: context.payload.pull_request.head.ref,
    environment,
  })
  if (deploymentList.length > 0) {
    return deploymentList[0]
  }
  for (const deployment of deploymentList) {
    await github.repos.createDeploymentStatus({
      owner: context.repo.owner,
      repo: context.repo.repo,
      deployment_id: deployment.id,
      state: 'inactive',
    })
    await github.repos.deleteDeployment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      deployment_id: deployment.id,
    })
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
  const deployment = await rereateDeployment(github, context, core, `pr-${context.issue.number}-${microservice}`)
  const createDeploymentStatus = {
    owner: context.repo.owner,
    repo: context.repo.repo,
    deployment_id: deployment.id,
    environment_url: `https://pr-${context.issue.number}-${microservice}.example.com`,
    log_url: `https://argocd.example.com/pr-${context.issue.number}-${microservice}`,
    mediaType: {
      previews: ['flash'],
    },
  }

  await sleep(5000 * Math.random())
  await github.repos.createDeploymentStatus({
    ...createDeploymentStatus,
    state: 'queued',
    description: 'Waiting for Argo CD polling',
  })

  await sleep(5000 * Math.random())
  await github.repos.createDeploymentStatus({
    ...createDeploymentStatus,
    state: 'pending',
    description: 'Argo CD is syncing',
  })

  await sleep(5000 * Math.random())
  await github.repos.createDeploymentStatus({
    ...createDeploymentStatus,
    state: 'in_progress',
    description: 'Waiting for ready',
  })

  await sleep(5000 * Math.random())
  await github.repos.createDeploymentStatus({
    ...createDeploymentStatus,
    state: 'success',
    description: 'Application is ready',
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
