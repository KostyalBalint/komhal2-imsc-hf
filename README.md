# Compare different AWS flavors

## Available flavor types

| Function name    | Price/ms |
|------------------|----------|
| imsc-lambda-128  | 21       |
| imsc-lambda-256  | 42       |
| imsc-lambda-512  | 83       |
| imsc-lambda-1024 | 167      |
| imsc-lambda-2048 | 333      |
| imsc-lambda-3072 | 500      |
| imsc-lambda-4096 | 667      |

## Used dataset

```javascript
let data = {
    user_1: 70,
    user_2: 10,
    user_3: 70,
    user_4: 20,
    user_5: 70,
    user_6: 30,
    user_7: 70,
    user_8: 70,
    user_9: 70,
    user_10: 50
};
```

## Execution types tested - Results
Two different execution types was tested, and the results were sorted by price, 
and fastest client side execution.

Note that at one-by-one execution all the jobs were executed parallel.

### Batch
All the data is fed to a single function
```bash
Batch execution result: 
Cheapest option: 
        Tier: imsc-lambda-1024 
        Total Price: 46593 nanocent 
        Client side time: 336.716708 ms 
Client side fastest: 
        Tier: imsc-lambda-4096 
        Total Price: 110722 nanocent 
        Client side time: 228.205458 ms 
```

### One by one
The data is split one by one
```bash
One by one execution result: 
Cheapest option: 
        Tier: imsc-lambda-512 
        Total Price: 36022 nanocent 
        Client side time: 158.760834 ms 
Client side fastest: 
        Tier: imsc-lambda-1024 
        Total Price: 36406 nanocent 
        Client side time: 139.134167 ms
```

## Conclusion
As the results show splitting up the data results in a faster and cheaper solution.
