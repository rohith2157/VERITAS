<#
.SYNOPSIS
  gnhf-graph.ps1 - Deterministic Task Graph Orchestrator for GNHF + Antigravity.
.DESCRIPTION
  Sequences task graphs, launches concurrent independent tasks in isolated Git worktrees,
  validates verification outcomes, and pauses at human approval gates.
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$GraphFile = "graph.json",

    [Parameter(Mandatory=$false)]
    [int]$DefaultMaxIterations = 2,

    [Parameter(Mandatory=$false)]
    [int]$DefaultTokenBudget = 50000,

    [Parameter(Mandatory=$false)]
    [string]$Agent = "acp:antigravity"
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   GNHF + ANTIGRAVITY TASK GRAPH ORCHESTRATOR             " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

if (-not (Test-Path $GraphFile)) {
    Write-Error "Graph specification file not found: $GraphFile"
    exit 1
}

$rawJson = Get-Content $GraphFile -Raw
$graph = ConvertFrom-Json $rawJson

Write-Host "Loaded Graph: $($graph.name)" -ForegroundColor Green
Write-Host "Total Nodes: $($graph.nodes.Count)" -ForegroundColor Green
Write-Host ""

$completedNodes = [System.Collections.Generic.HashSet[string]]::new()
$failedNodes = [System.Collections.Generic.HashSet[string]]::new()
$nodeLookup = @{}
foreach ($node in $graph.nodes) {
    $nodeLookup[$node.id] = $node
}

function Test-NodeReady($node) {
    if ($completedNodes.Contains($node.id) -or $failedNodes.Contains($node.id)) {
        return $false
    }
    if (-not $node.dependencies -or $node.dependencies.Count -eq 0) {
        return $true
    }
    foreach ($dep in $node.dependencies) {
        if (-not $completedNodes.Contains($dep)) {
            return $false
        }
    }
    return $true
}

$runStartTime = Get-Date

while ($completedNodes.Count + $failedNodes.Count -lt $graph.nodes.Count) {
    $readyNodes = @()
    foreach ($node in $graph.nodes) {
        if (Test-NodeReady $node) {
            $readyNodes += $node
        }
    }

    if ($readyNodes.Count -eq 0) {
        if ($failedNodes.Count -gt 0) {
            Write-Host "Graph execution halted due to previous task failures." -ForegroundColor Red
            break
        } else {
            Write-Error "Graph deadlock detected: No remaining nodes can execute."
            break
        }
    }

    Write-Host "----------------------------------------------------------" -ForegroundColor Yellow
    Write-Host "Executing Wave: $($readyNodes.Count) task(s) ready" -ForegroundColor Yellow
    foreach ($rn in $readyNodes) {
        Write-Host "  - [$($rn.id)] $($rn.objective)" -ForegroundColor Yellow
    }
    Write-Host "----------------------------------------------------------" -ForegroundColor Yellow

    # If only 1 node, execute directly. If multiple, execute in parallel worktrees.
    if ($readyNodes.Count -eq 1 -and -not $readyNodes[0].isConcurrent) {
        $node = $readyNodes[0]
        if ($node.type -eq "approval_gate") {
            Write-Host ""
            Write-Host "[HUMAN APPROVAL GATE REQUIRED]" -ForegroundColor Magenta
            Write-Host "Task ID: $($node.id)" -ForegroundColor Magenta
            Write-Host "Objective: $($node.objective)" -ForegroundColor Magenta
            $confirmation = Read-Host "Do you approve proceeding with this step? (yes/no)"
            if ($confirmation -eq "yes") {
                Write-Host "Approved by human engineer." -ForegroundColor Green
                $completedNodes.Add($node.id) | Out-Null
            } else {
                Write-Host "Rejected by human engineer." -ForegroundColor Red
                $failedNodes.Add($node.id) | Out-Null
            }
            continue
        }

        Write-Host "Running sequential node [$($node.id)]..." -ForegroundColor Cyan
        $iterLimit = if ($node.maxIterations) { $node.maxIterations } else { $DefaultMaxIterations }
        
        $p = Start-Process -FilePath "gnhf.cmd" -ArgumentList @(
            "--agent", $Agent,
            "--max-iterations", "$iterLimit",
            "--meteor-frequency", "0",
            $node.objective
        ) -NoNewWindow -PassThru -Wait

        if ($p.ExitCode -eq 0) {
            Write-Host "Node [$($node.id)] completed successfully." -ForegroundColor Green
            $completedNodes.Add($node.id) | Out-Null
        } else {
            Write-Host "Node [$($node.id)] failed with exit code $($p.ExitCode)." -ForegroundColor Red
            $failedNodes.Add($node.id) | Out-Null
        }
    } else {
        # Parallel wave using Git worktrees
        $jobs = @()
        foreach ($node in $readyNodes) {
            $iterLimit = if ($node.maxIterations) { $node.maxIterations } else { $DefaultMaxIterations }
            Write-Host "Launching concurrent worktree worker for [$($node.id)]..." -ForegroundColor Cyan
            
            $sb = {
                param($agent, $iter, $obj)
                & gnhf.cmd --agent $agent --worktree --max-iterations $iter --meteor-frequency 0 $obj
            }
            $job = Start-Job -ScriptBlock $sb -ArgumentList $Agent, $iterLimit, $node.objective
            $jobs += @{ Node = $node; Job = $job }
        }

        # Wait for all workers in this wave
        foreach ($item in $jobs) {
            $res = Wait-Job -Job $item.Job
            $out = Receive-Job -Job $item.Job
            Remove-Job -Job $item.Job

            if ($item.Job.State -eq "Completed") {
                Write-Host "Worktree task [$($item.Node.id)] completed." -ForegroundColor Green
                $completedNodes.Add($item.Node.id) | Out-Null
            } else {
                Write-Host "Worktree task [$($item.Node.id)] failed." -ForegroundColor Red
                $failedNodes.Add($item.Node.id) | Out-Null
            }
        }
    }
}

$duration = (Get-Date) - $runStartTime

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "GRAPH EXECUTION SUMMARY" -ForegroundColor Cyan
Write-Host "Total Execution Time: $($duration.ToString('mm\:ss'))" -ForegroundColor Cyan
Write-Host "Completed Nodes: $($completedNodes.Count)" -ForegroundColor Green
Write-Host "Failed Nodes:    $($failedNodes.Count)" -ForegroundColor Red
Write-Host "==========================================================" -ForegroundColor Cyan
