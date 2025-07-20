// its task is to take in the job, check for free worker and if found invoke the runjob if not
// wait and go look for the response and in the meantime if any worker that says my build is successful or if sends a state is free contact me type of thing

package dispatcher

import (
	"context"
	"fmt"

	"github.com/Blacktreein/Blacktree/build-orchestrator/internal/workerman"
)

func JobDispatcher(ctx context.Context, ds *DispatcherState, manager *workerman.WorkerManager) error {
	for { // for loop becauase we want to run it continously
		select { // even if ctx.done channel is empty and job channel select will make it stuck here so that when something is triggered, it performs action
		case <-ctx.Done():
			fmt.Println("⚠️ Dispatcher shutting down...")
			return nil
		case worker := <-manager.FreeWorkers:
			select {
			case job := <-ds.JobQueue:
				fmt.Printf("Dispatching Job %s to Worker %s\n", job.DeploymentID, worker.Info.Id)
				go ExecuteRunJobRPC(manager, worker, job) // execute the task
			default:
				select {
				case manager.FreeWorkers <- worker: // assign the task to freeworker
				default: // do nothing if worker channel isnt freee

				}
			}

			// we are also decoupling the logic for periodically checking for the state of workers
		}

		// here we are looping for availabe jobs bad idea
		// case job := <-ds.JobQueue: // the job is a pointer // using pointer because IT CAN BE NIL
		// 	select { // if job is recieved wait for the job to be assign
		// 	case worker := <-manager.FreeWorkers:
		// 		fmt.Printf("Dispatching Job %s to Worker %s\n", job.DeploymentID, worker.Info.Id)
		// 		go ExecuteRunJobRPC(manager, worker, job) // to execute

		// 	default:
		// 		fmt.Printf("No workers available for Job %s. Requeueing...\n", job.DeploymentID)

		// 		// 2 ways to assign the task
		// 		// FIRST: we send the check health signal and someone tells that yoo a worker is free and put in workers channel
		// 		go func(job *queue.DeploymentMessage) {
		// 			freeWorkers, err := manager.CheckHealthForAll()
		// 			if err = utils.FailedOnError("Dispatcher", err, "Health Check failed "); err != nil {
		// 				return
		// 			}

		// 			if len(freeWorkers) == 0 {
		// 				log.Printf("⚠️ Still no free workers. Re-queuing Job %s\n", job.DeploymentID)
		// 				// time.Sleep(1)
		// 				go func() {
		// 					select {
		// 					case ds.JobQueue <- job:
		// 						log.Printf("♻️ Job %s requeued successfully\n", job.DeploymentID)
		// 					case <-ctx.Done():
		// 						log.Printf("🛑 Context closed before requeueing Job %s\n", job.DeploymentID)
		// 					}
		// 				}()

		// 				return // to get out of that goroutine
		// 			}

		// 			// Assign job to first available free worker
		// 			fmt.Printf("✅ Found worker %s for Job %s after health check\n", freeWorkers[0].Info.Id, job.DeploymentID)
		// 			go ExecuteRunJobRPC(manager, freeWorkers[0], job)

		// 		}(job)

		// 		// SECOND: any RunJob completes its success and then we assign it the task and for rest of the free workers( thinking about using channel but then we can send the free worker to workers and set the rest of the workes state to free)
		// 		// this will be handled automatically because if a worker is free we are setting up in a buffer channel

		// 	}

		// }
	}

}

/*
abhi ye chl rha hai ki

jb ek msg aaya to sbse phele ye dheka ki workers channel khali hai ya bhra
agr bhara mtlb khali worker available hai...

agr nhi to khali workers available nhi tb check run kro separate goroutine pr jo healthcheck krega

fir sbka response milega tbkt wait kro

aur jb sbka response mil jaye to free workers ka array prepare krke do jo hm baad mei workers channel mei tbtk bharenge jbtk vo bhar na jaye


ek baar jb vo bhar jaye to repeate the logic

isme hm SelectNextWorker() use hi nhi kr rhe hai

*/
