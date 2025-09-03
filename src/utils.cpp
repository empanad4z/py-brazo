#include <utils.h>

int degreesToSteps(float degrees) {
    float stepsPerDegree = (float) STEPSXREV / 360.0;
    return (int) (degrees * stepsPerDegree);
}