package tracker

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"
)

var mu sync.Mutex // Mutex to ensure thread safety (safe concurrent access to file)

const trackerFilePath = "./data/repos.json" // the location of the tracker file

type RepoEntry struct {
	DeploymentID string `json:"deploymentId"` // Unique ID for the deployment
	Path         string `json:"path"`         // JSON tag: field becomes "path" in JSON (not "Path")
	Repo         string `json:"repo"`         // used to store the repo name
	Status       string `json:"status"`       // e.g. "cloned", "built"
	CreatedAt    int64  `json:"createdAt"`    // Unix timestamp for sorting/cleanup
}

// SaveEntry adds a new entry to the tracker file
func SaveEntry(entry RepoEntry) error {
	mu.Lock()         // Ensure thread safety
	defer mu.Unlock() // Unlock after saving

	entries, _ := LoadAllEntries() // Load existing entries (ignore error intentionally)

	entries = append(entries, entry) // Append new entry

	if err := EnsureTrackerDir(trackerFilePath); err != nil {
		return fmt.Errorf("failed to ensure tracker directory: %w", err)
	}

	fmt.Printf("📦 Saving entry for repo: %s at %s\n", entry.Repo, entry.Path)

	file, err := os.Create(trackerFilePath) // Overwrites existing file or creates new

	if err != nil {
		return fmt.Errorf("failed to create tracker file: %w", err)
	}
	defer file.Close()

	enc := json.NewEncoder(file) // Encoder writes JSON to file
	enc.SetIndent("", "  ")      // Pretty print JSON for readability
	return enc.Encode(entries)   // Serialize all entries back to file
}

// LoadAllEntries reads all tracked repo entries
func LoadAllEntries() ([]RepoEntry, error) {
	file, err := os.Open(trackerFilePath) // Open file for reading
	if err != nil {
		if os.IsNotExist(err) {
			return []RepoEntry{}, nil // Return empty slice if file doesn't exist yet
		}
		return nil, fmt.Errorf("failed to open tracker file: %w", err)
	}
	defer file.Close()

	var entries []RepoEntry
	if err := json.NewDecoder(file).Decode(&entries); err != nil {
		return nil, fmt.Errorf("failed to decode tracker file: %w", err)
	}
	return entries, nil
}

// DeleteEntry removes an entry from the tracker file by DeploymentID
func DeleteEntry(deploymentID string) error {
	mu.Lock()         // Ensure thread safety
	defer mu.Unlock() // Unlock after deleting

	entries, err := LoadAllEntries() // Load existing entries
	if err != nil {
		return fmt.Errorf("failed to load tracker entries: %w", err)
	}

	// Filter out the entry with the given DeploymentID

	// store entry

	var toDeleteEntry *RepoEntry
	var updatedEntries []RepoEntry
	for _, entry := range entries {
		if entry.DeploymentID != deploymentID {
			updatedEntries = append(updatedEntries, entry)
		} else {
			toDeleteEntry = &entry // Store the entry to be deleted
		}
	}

	if toDeleteEntry==nil {
		return fmt.Errorf("no entry found with DeploymentID: %s", deploymentID)
	}

	if err := EnsureTrackerDir(trackerFilePath); err != nil {
		return fmt.Errorf("failed to ensure tracker directory: %w", err)
	}

	// log the deletion action
	fmt.Printf("🗑️ Deleting entry for repo: %s at %s\n", toDeleteEntry.Repo, toDeleteEntry.Path)

	// deleting the folder 
	if err := os.RemoveAll(toDeleteEntry.Path); err != nil {
		return fmt.Errorf("failed to delete repo folder: %w", err)
	}

	// overwriting the repos.json file with updated entries
	file, err := os.Create(trackerFilePath) // Overwrites existing file or creates new
	if err != nil {
		return fmt.Errorf("failed to create tracker file: %w", err)
	}
	defer file.Close()

	enc := json.NewEncoder(file)      // Encoder writes JSON to file
	enc.SetIndent("", "  ")           // Pretty print JSON for readability
	return enc.Encode(updatedEntries) // Serialize updated entries back to file
}

// ensureTrackerDir creates the directory for the tracker file if it doesn't exist
func EnsureTrackerDir(trackpath string) error {
	dir := filepath.Dir(trackpath) // Get directory path from full file path
	return os.MkdirAll(dir, 0755)        // Create dir and parents if missing
}
