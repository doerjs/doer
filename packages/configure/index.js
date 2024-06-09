import Configure from './Configure.js'
import Common from './Common.js'
import ArraySet from './ArraySet.js'
import ObjectSet from './ObjectSet.js'
import ClassSet from './ClassSet.js'

Configure.register(Common)
Configure.register(ObjectSet)
Configure.register(ArraySet)
Configure.register(ClassSet)

export { Configure, ArraySet, ObjectSet, ClassSet }
