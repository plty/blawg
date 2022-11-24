export const cppCode = `\
#include<iostream>
int f(int x) {
    return x < 2 ? x : f(x - 1) + f(x - 2);
}

int g(int x) {
    return x == 0 ? 1 : x * g(x - 1);
}
`;

export const notCppCode = `\
def f(x):
    return x * x + x

def main():
    print(f(20))
`;
