// its task is to take in the job, check for free worker and if found invoke the runjob if not
// wait and go look for the response and in the meantime if any worker that says my build is successful or if sends a state is free contact me type of thing

package dispatcher

import (
	"context"
	"fmt"

	"github.com/Blacktreein/Blacktree/build-orchestrator/internal/queue"
	"github.com/Blacktreein/Blacktree/build-orchestrator/internal/workerman"
)

func JobDispatcher(ctx context.Context, jobs <-chan queue.DeploymentMessage, workers <-chan workerman.Worker) {
	for { // for loop becauase we want to run it continously
		select { // even if ctx.done channel is empty and job channel select will make it stuck here so that when something is triggered, it performs action
		case <-ctx.Done():
			fmt.Println("⚠️ Dispatcher shutting down...")
			return

		case job := <-jobs:
			select { // if job is recieved wait for the job to be assign
			case worker := <-workers:
				fmt.Printf("Dispatching Job %s to Worker %s\n", job.DeploymentID, worker.Info.Id)
			default:
				fmt.Printf("No workers available for Job %s. Requeueing...\n", job.DeploymentID) 

				// 2 ways to assign the task
				// FIRST: we send the check health signal and someone tells that yoo a worker is free and put in workers channel 
				


				// SECOND: any RunJob completes its success and then we assign it the task and for rest of the free workers( thinking about using channel but then we can send the free worker to workers and set the rest of the workes state to free)


			}

		}
	}

}
