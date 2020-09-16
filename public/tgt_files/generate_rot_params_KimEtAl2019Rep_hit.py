"""
This script is for generating JSON target files directly, which is the form used in the experiment. 
To implement target jump, clamp, or online feedback make appropriate changes in the area flagged by the **TODO** comment.
"""
import json
import random

"""def generateTargetAngles(numTargets):
    >>> generateTargetAngles(4)
    [0, 90, 180, 270]
    angleDifference = int(360 / numTargets)
    angleList = []
    for i in range(0, 360, angleDifference):
        angleList.append(i + 30)
    return angleList
"""
def generateTargetAngles(numTargets):
    """
    temporary usage of this function for non-evenly spaced targets
    """
    angleInterval = 45/(numTargets - 1)
    angleStart = 45
    angleList = [0] * numTargets
    for x in range(0, numTargets):
        angleList[x] = angleStart + (angleInterval * x)

    if (len(angleList) != numTargets):
        raise Exception('Target file does not have the right amount of targets. Should have ' + str(numTargets) + ' targets, but only has ' + str(len(angleList)))
    
    return angleList

def generateJSON(numTargets, movementCycle, cycleDistribution, rotationAngle, targetDistance, numDemoCycles, demoTargetAngle):
    # Ensure non demo cycles add up
    if (movementCycle != sum(cycleDistribution)):
        raise Exception('Number of non demo cycles do not add up. Should have ' + str(movementCycle) + ' cycles, but has ' + str(sum(cycleDistribution)) + '.')
    if (len(cycleDistribution) != 4):
        raise Exception('Incorrect amount of entries in cycle distribution, should have 4 but has ' + str(len(cycleDistribution)) + '.')
    jsonData = {}
    targetAngles = generateTargetAngles(numTargets)
    numTrials = numTargets * movementCycle # block size
    numDemoTrials = 3 # just have 3 demo trials like in the Kim et al 2019 paper
    totalNumTrials = numTrials + numDemoTrials
    jsonData["numtrials"] = totalNumTrials
    trialNums = {}
    aimingLandmarks = {}
    onlineFB = {}
    endpointFB = {}
    rotation = {}
    clampedFB = {}
    tgtDistance = {}
    angles = []
    anglesDict = {}
    betweenBlocks = {}
    targetJump = {}
    targetSize = {}
    
    # Breakpoints between phases
    base_no_fb = cycleDistribution[0] * numTargets
    base_fb = base_no_fb + (cycleDistribution[1] * numTargets)
    demo = base_fb + numDemoTrials
    rotate = demo + (cycleDistribution[2] * numTargets) # number of trials in the rotation phase
    aftereffect_no_fb = rotate + (cycleDistribution[3] * numTargets)
    if (totalNumTrials != aftereffect_no_fb):
        raise Exception('Number of reaches do not add up. Should have ' + str(totalNumTrials) + ' targets, but only has ' + str(aftereffect_no_fb) + '.')

    # Update the blocks whenever numTrials is changed.
    # **TODO** Update values from 0 --> 1 to toggle effects
    # For target jump, 1 ==> jump to target, any other integer != 0 or 1 ==> jump away from target to that degree
    for i in range(totalNumTrials):
        trialNums[i] = i + 1
        aimingLandmarks[i] = 0
        tgtDistance[i] = targetDistance
        targetSize[i] = 9 # 3.5 causes straddle (on my screen) with a 1.75 degree error, 9 causes hit
        if i < base_no_fb : # baseline acclimation phase without online cursor feedback, will have cycleDistribution[0] of these trials for every target
            onlineFB[i] = 0
            endpointFB[i] = 0
            rotation[i] = float(0)
            clampedFB[i] = float(0)
            targetJump[i] = float(0)
        elif i < base_fb : # baseline phase with online feedback, will have cycleDistribution[1] of these trials for every target
            onlineFB[i] = 1
            endpointFB[i] = 1
            rotation[i] = float(0)
            clampedFB[i] = float(0)
            targetJump[i] = float(0)
        elif i < demo: # practice trials? will have numDemoTrials of these where it's explained to the participant that they will lose control over the cursor
            # right now, this phase demonstrates to the participant what the clamp is going to look like
            # for some reason, it is doing X cycles * number of targets, but I'm not sure why, because there is only one demo target right now
            onlineFB[i] = 1
            endpointFB[i] = 1
            rotation[i] = float(rotationAngle)
            clampedFB[i] = float(1)
            targetJump[i] = float(0)
        elif i < rotate : # training trials, will have cucleDistribution[2] of these for every target location
            # for this experiment, keep feedback constant throughout the block
            onlineFB[i] = 1
            endpointFB[i] = 1    
            
            # to randomize trial types, add a randomization function in here and some if else statements
            #randomtt = random.randint(0,3)
            randomtt = 3 # cursor rotation without moving target
            if randomtt==0 : # no errors (0 error clamp), working as of 9/3/2020
                rotation[i] = float(0)
                clampedFB[i] = float(1)
                targetJump[i] = float(0)
            elif randomtt==1 : # SPE only (clamp some rotation with target jump to cursor end), working as of 9/3/2020
                rotation[i] = float(rotationAngle)
                clampedFB[i] = float(1)
                targetJump[i] = float(1)
            elif randomtt==2 : # RPE only (clamp straight to target with target jump away from cursor end), working as of 9/3/2020
                rotation[i] = float(0)
                clampedFB[i] = float(1)
                targetJump[i] = float(10)
            else: # SPE and RPE (clamp with some rotation, no target jump), working as of 9/3/2020
                rotation[i] = float(rotationAngle)
                clampedFB[i] = float(1)
                targetJump[i] = float(0)
                
        else: # no-feedback test trials, will have cycleDistribution[3] of these for every target location
            onlineFB[i] = 0
            endpointFB[i] = 0
            rotation[i] = float(0)
            clampedFB[i] = float(0)
            targetJump[i] = float(0)

    # Shuffle the targets 
    for i in range(totalNumTrials):
        if i % numTargets == 0:
            angles = targetAngles
            random.shuffle(angles)
        anglesDict[i] = float(angles[i % len(angles)])
        betweenBlocks[str(i)] = 0.0

    # Set up all demo targets
    for i in range(base_fb, demo):
        anglesDict[i] = float(demoTargetAngle)
    for i in range(base_fb - 1, demo - 1):
        betweenBlocks[str(i)] = 6
    
    # Should automatically be updated by now
    # 1 = baseline feedback instructions
    # 2 = experiment paradigm understanding instructions
    # 3 = after effect no feedback instructions
    # 4 = attention check press 'a'
    # 5 = attention check press 'e'
    # 6 = demo instructions
    betweenBlocks[str(base_no_fb - 1)] = 1
    betweenBlocks[str(demo - 1)] = 2
    betweenBlocks[str(rotate - 1)] = 3
    # Attention check blocks // 5 = press 'a', 4 == press 'e', randomly pick spots before 50 trials, double check with index.js for consistency.
    if (totalNumTrials > 39):
        betweenBlocks[str(6)] = 4
        betweenBlocks[str(14)] = 5
        betweenBlocks[str(24)] = 4
        betweenBlocks[str(39)] = 5


    jsonData["trialnum"] = trialNums
    jsonData["aiming_landmarks"] = aimingLandmarks
    jsonData["online_fb"] = onlineFB
    jsonData["endpoint_feedback"] = endpointFB
    jsonData["rotation"] = rotation
    jsonData["clamped_fb"] = clampedFB
    jsonData["tgt_angle"] = anglesDict
    jsonData["tgt_distance"] = tgtDistance
    jsonData["between_blocks"] = betweenBlocks
    jsonData["target_jump"] = targetJump
    jsonData["tgt_size"] = targetSize
 
    for key in jsonData.keys():
        print ("key: ", key)
        print ("value: ", jsonData[key])
        print ("")

    with open('KimEtAl2019Rep_hitCW.json', 'w') as outfile:
        json.dump(jsonData, outfile)


nonDemoCycles = [2, 2, 10, 0]
generateJSON(8, 14, nonDemoCycles, -1.75, 80, 1, 270)
"""
The above call 'generateJSON(2, 8, nonDemoCycles, -10, 80, 2, 270)' will generate a target file with:
- 2 targets
- 8 cycles (8 x 2 = 16 reaches) distributed into cycles of 2 (split by nonDemoCycles)
- -10 rotation angle (10 degrees clockwise)
- TargetDistance is not obsolete
- 2 demo cycles at 270 degrees (straight down)
"""

